import {ISignUpResponse, ISignUpRequest} from "@/dao";

export const LoginService = {
    signUp: async (email: string, password: string) => {
        try {
            const res = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password } as ISignUpRequest),
              });
              const data = await res.json();
              return data as ISignUpResponse;
        } catch (error) {
            console.error(error);
        }
        return null;
    }
}