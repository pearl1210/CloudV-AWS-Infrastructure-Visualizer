import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { userLoginSchema, type LoginInputState } from "@/schema/userSchema"
import { useUserStore } from "@/store/useUserStore"
import { Loader2, LockKeyhole, Mail } from "lucide-react"
import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"


const Login = () => {

    const [input, setInput] = useState<LoginInputState>({
        email: "",
        password: ""
    })

    const navigate = useNavigate();

    const [errors, setErrors] = useState<Partial<LoginInputState>>({});
    const { loading, login } = useUserStore();

    const changeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    }

    const loginSubmitHandler = async(e: FormEvent) => {
        e.preventDefault();
        const result = userLoginSchema.safeParse(input);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            const formattedErrors: Partial<LoginInputState> = {};

            for (const key in fieldErrors) {
                const field = key as keyof LoginInputState;
                formattedErrors[field] = fieldErrors[field]?.[0] || "";
            }
            setErrors(formattedErrors);
            return;
        }
        setErrors({});

        const success = await login(input);
        if (success) {
            navigate("/dashboard", { replace: true });
        }

    }

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <form
                className='md:p-8 w-full max-w-md rounded-lg md:border border-gray-200 mx-4'
                onSubmit={loginSubmitHandler}
            >
                <div className="mb-4">
                    <h1 className='font-bold text-2xl'>CloudV</h1>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            name="email"
                            value={input.email}
                            onChange={changeEventHandler}
                            className="pl-10 focus-visible:ring-1"
                        />
                        <Mail className="absolute inset-y-2 left-2 top-1  text-gray-500 pointer-events-none" />
                        {errors.email && (
                            <span className="text-xs text-red-500">{errors.email}</span>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            name="password"
                            value={input.password}
                            onChange={changeEventHandler}
                            className="pl-10 focus-visible:ring-1"
                        />
                        <LockKeyhole className="absolute inset-y-2 left-2 top-1  text-gray-500 pointer-events-none" />
                        {errors.password && (
                            <span className="text-xs text-red-500">{errors.password}</span>
                        )}
                    </div>
                </div>

                <div className="mb-10">
                    {loading ? (
                        <Button disabled className="w-full bg-gray-700 hover:bg-gray-800">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="w-full bg-gray-700 hover:bg-gray-800"
                        >
                            Login
                        </Button>
                    )}
                </div>

                <Separator />
                <p className="mt-2">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-500">
                        Signup
                    </Link>
                </p>
            </form>

        </div>
    )
}

export default Login
