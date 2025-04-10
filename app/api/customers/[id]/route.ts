import { NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { updateCustomerSchema } from "@/app/lib/validations/customer";
import { z } from "zod";
import {
  errorResponse,
  handleSupabaseError,
  handleValidationError,
  successResponse,
} from "@/app/lib/api-response";

export interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/customers/[id]
 * Get a specific customer by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return errorResponse("Invalid customer ID format", 400);
    }

    // Fetch customer
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        created_by_user:users!customers_created_by_fkey(id, email, role),
        customer_managers:customer_managers(
          id,
          user_id,
          assigned_at,
          users:users(id, email, role)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Customer not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * PUT /api/customers/[id]
 * Update a specific customer
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return errorResponse("Invalid customer ID format", 400);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCustomerSchema.parse({ ...body, id });

    // Remove id from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = validatedData;

    // Update customer in database
    const { data, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Customer not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }

    console.error("Error updating customer:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a specific customer
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return errorResponse("Invalid customer ID format", 400);
    }

    // Delete customer from database
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Customer not found", 404);
      }
      return handleSupabaseError(error);
    }

    return successResponse({ id, deleted: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
