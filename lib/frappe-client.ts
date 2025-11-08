// lib/frappe-client.ts
import { FrappeApp } from "frappe-js-sdk";

// Frappe Error Interface
export interface FrappeError {
  message: string;
  httpStatus?: number;
  httpStatusText?: string;
  exceptions?: string[];
  exception?: string;
  _server_messages?: string; // *** KEY: Add this property ***
}

// Type guard for FrappeError
export function isFrappeError(error: unknown): error is FrappeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as FrappeError).message === "string"
  );
}

// API Response Types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details: string; // This will now contain the user-friendly message
  statusCode?: number;
  frappeError?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Frappe Client Singleton
class FrappeClient {
  private static instance: FrappeClient;
  public db: ReturnType<FrappeApp["db"]>;
  public auth: ReturnType<FrappeApp["auth"]>;
  public call: ReturnType<FrappeApp["call"]>;
  public file: ReturnType<FrappeApp["file"]>;

  private constructor() {
    const erpApiUrl = process.env.NEXT_PUBLIC_ERP_API_URL;
    const erpApiKey = process.env.ERP_API_KEY;
    const erpApiSecret = process.env.ERP_API_SECRET;

    if (!erpApiUrl || !erpApiKey || !erpApiSecret) {
      throw new Error("Missing ERP API environment variables");
    }

    const frappe = new FrappeApp(erpApiUrl, {
      useToken: true,
      token: () => `${erpApiKey}:${erpApiSecret}`,
      type: "token",
    });

    this.db = frappe.db();
    this.auth = frappe.auth();
    this.call = frappe.call();
    this.file = frappe.file();
  }

  public static getInstance(): FrappeClient {
    if (!FrappeClient.instance) {
      FrappeClient.instance = new FrappeClient();
    }
    return FrappeClient.instance;
  }

  // *** UPDATED: Helper method to handle Frappe errors ***
  public handleError(error: unknown): ApiErrorResponse {
    console.error("Frappe Client Error:", error);

    if (isFrappeError(error)) {
      let userFriendlyMessage = "An unexpected error occurred.";
      let statusCode = error.httpStatus || 500;

      // 1. Try to get the best message from _server_messages (most reliable)
      if (error._server_messages) {
        try {
          const serverMessages = JSON.parse(error._server_messages);
          if (Array.isArray(serverMessages) && serverMessages.length > 0) {
            const parsedMessage = JSON.parse(serverMessages[0]);
            if (parsedMessage.message) {
              // Sanitize HTML from the message (e.g., <strong>P-004</strong>)
              userFriendlyMessage = this.sanitizeHtml(parsedMessage.message);
            }
          }
        } catch (e) {
          console.warn("Failed to parse _server_messages, falling back to default message.");
        }
      }

      // 2. Fallback: Infer message from the raw exception string if _server_messages wasn't helpful
      if (userFriendlyMessage === "An unexpected error occurred.") {
        const rawError = error.exceptions?.join(' ') || error.exception || '';
        if (rawError.includes("DuplicateEntryError") || rawError.includes("already exists")) {
          userFriendlyMessage = "A record with these details already exists.";
          statusCode = 409;
        } else if (rawError.includes("PermissionError")) {
          userFriendlyMessage = "You do not have permission to perform this action.";
          statusCode = 403;
        } else if (rawError.includes("DoesNotExistError") || rawError.includes("not found")) {
          userFriendlyMessage = "The requested resource was not found.";
          statusCode = 404;
        } else if (rawError.includes("MandatoryError") || rawError.includes("required")) {
          userFriendlyMessage = "Required fields are missing.";
          statusCode = 400;
        } else {
            userFriendlyMessage = error.message; // Use the generic message as a last resort
        }
      }

      return {
        success: false,
        error: "Request Failed",
        details: userFriendlyMessage,
        statusCode,
        frappeError: error.exceptions || error.exception,
      };
    }

    // Fallback for non-Frappe errors
    if (error instanceof Error) {
      return {
        success: false,
        error: "Application Error",
        details: error.message,
      };
    }

    return {
      success: false,
      error: "Unknown Error",
      details: String(error),
    };
  }

  // *** HELPER: Simple method to remove HTML tags ***
  private sanitizeHtml(html: string): string {
    // For production, consider a more robust library like DOMPurify
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
}

export const frappeClient = FrappeClient.getInstance();