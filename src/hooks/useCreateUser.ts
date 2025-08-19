import { useState } from "react";
import {
  createUser,
  CreateUserRequest,
  CreateUserResponse,
} from "@/api/users/createUser";

interface UseCreateUserState {
  isLoading: boolean;
  error: string | null;
  data: CreateUserResponse | null;
}

interface UseCreateUserReturn extends UseCreateUserState {
  createUserAsync: (userData: CreateUserRequest) => Promise<CreateUserResponse>;
  reset: () => void;
}

export const useCreateUser = (): UseCreateUserReturn => {
  const [state, setState] = useState<UseCreateUserState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const createUserAsync = async (
    userData: CreateUserRequest
  ): Promise<CreateUserResponse> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await createUser(userData);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        data: response,
        error: null,
      }));
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        data: null,
      }));
      throw error;
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  };

  return {
    ...state,
    createUserAsync,
    reset,
  };
};
