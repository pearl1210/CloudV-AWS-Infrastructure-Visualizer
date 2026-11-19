import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Loader2, LockKeyhole, Mail, User } from "lucide-react"
import type { ChangeEvent, FormEvent } from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { userSignupSchema, type SignupInputState } from "@/schema/userSchema"
import { useUserStore } from "@/store/useUserStore"


const Signup = () => {

    const [input, setInput] = useState<SignupInputState>({
        fullname: "",
        email: "",
        password: "",
    })

    const { signup, loading } = useUserStore();
    const navigate = useNavigate();


    const [errors, setErrors] = useState<Partial<SignupInputState>>({});

    const changeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    }

    const signupSubmitHandler = async (e: FormEvent) => {
        e.preventDefault();

        const result = userSignupSchema.safeParse(input);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            const formattedErrors: Partial<SignupInputState> = {};

            for (const key in fieldErrors) {
                const field = key as keyof SignupInputState;
                formattedErrors[field] = fieldErrors[field]?.[0] || "";
            }
            setErrors(formattedErrors);
            return;
        }

        setErrors({});

        const success = await signup(input);
        if (success) {
            navigate("/dashboard", { replace: true });
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <form
                className='md:p-8 w-full max-w-md rounded-lg md:border border-gray-200 mx-4'
                onSubmit={signupSubmitHandler}
            >
                <div className="mb-4">
                    <h1 className='font-bold text-2xl'>CloudV</h1>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Full name"
                            autoComplete="name"
                            name="fullname"
                            value={input.fullname}
                            onChange={changeEventHandler}
                            className="pl-10 focus-visible:ring-1"
                        />
                        <User className="absolute inset-y-2 left-2 top-1  text-gray-500 pointer-events-none" />
                        {errors.fullname && (
                            <span className="text-xs text-red-500">{errors.fullname}</span>
                        )}
                    </div>
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
                            autoComplete="new-password"
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
                        <Button type="submit" className="w-full bg-gray-700 hover:bg-gray-800">
                            Signup
                        </Button>
                    )}
                </div>

                <Separator />
                <p className="mt-2">
                    have an account?{" "}
                    <Link to="/login" className="text-blue-500">
                        Login
                    </Link>
                </p>
            </form>

        </div>
    )
}

export default Signup
