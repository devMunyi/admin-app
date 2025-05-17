"use client";

import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import Label from "../temp-ui/form/Label";
import Input from "../temp-ui/form/input/InputField";
import Button from "../temp-ui/button/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "../temp-ui/form/Form";
import { signInFormInferSchema, signInFormSchema } from "@/lib/validators/authSchema";
import { Loader2, CheckCircle2 } from "lucide-react";
import ComponentCard from "../common/ComponentCard";
import { useSignInMutation } from "@/lib/services/api/users/mutation"; // Import the custom hook

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signInFormInferSchema>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "samunyi90@gmail.com",
      password: "defaultPass",
    },
    reValidateMode: "onChange",
  });

  const signInMutation = useSignInMutation(); // Use the custom hook

  const onSubmit = (data: signInFormInferSchema) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <ComponentCard title="Sign In">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>
          <div>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6 pb-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                    hint={errors.email?.message}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative min-h-[72px]">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      error={!!errors.password}
                      hint={errors.password?.message}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/3"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="md"
                    type="submit"
                    disabled={signInMutation.isPending || signInMutation.isSuccess}
                  >
                    {signInMutation.isPending ? (
                      <Loader2 className="animate-spin" size="24" />
                    ) : signInMutation.isSuccess ? (
                      <div className="flex items-center gap-2 text-success-500">
                        <CheckCircle2 size="24" />
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}