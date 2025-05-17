// app/users/components/edit-user-modal.tsx
"use client";

import { Modal } from '@/components/temp-ui/modal';
import Button from "@/components/temp-ui/button/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Form from '@/components/temp-ui/Form';
import Label from '@/components/temp-ui/form/Label';
import Input from '@/components/temp-ui/form/input/InputField';
import { USER_ROLES, USER_STATUSES } from '@/lib/constants';
import { editUserSchema, EditUserValues } from '@/lib/validators/authSchema';
import Select from '@/components/temp-ui/form/Select';
import { users_role, users_status } from '@/generated/prisma';
import { useUpdateUserMutation } from '@/lib/services/api/users/mutation';
import { EditUserModalProps } from '@/lib/types';

export default function EditUserModal({ isOpen, onClose, onSuccess, user, branches }: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      phone: '',
      national_id: '',
      branch_id: undefined,
      email: '',
      role: undefined,
      status: undefined,
      password: '',
    },
    reValidateMode: "onChange",
  });

  // Set form values when user data changes
  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone);
      setValue('national_id', user.national_id);
      setValue('branch_id', user.branch.id);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('status', user.status);
    }
  }, [user, setValue]);

  const { mutate: updateUserMutate, isPending: pending } = useUpdateUserMutation({
    userId: user?.public_id || '',
    onSuccess,
    onClose,
    resetForm: reset
  });

  const onSubmit = (data: EditUserValues) => {
    updateUserMutate(data);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] p-4 lg:p-8"
    >
      <div className='flex flex-col px-2 overflow-y-auto custom-scrollbar'>
        <div>
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            Edit User
          </h5>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Update the user details
          </p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <Label>
                Full Name <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="name"
                {...register("name")}
                error={!!errors.name}
                hint={errors.name?.message}
                disabled={pending}
              />
            </div>

            <div>
              <Label>
                Phone <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Phone"
                type="phone"
                {...register("phone")}
                error={!!errors.phone}
                success={!!errors.phone && !errors.phone?.message}
                hint={errors.phone?.message}
                disabled={pending}
              />
            </div>

            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Email"
                type="email"
                {...register("email")}
                error={!!errors.email}
                hint={errors.email?.message}
                disabled={pending}
              />
            </div>
            <div>
              <Label>
                National ID <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="National ID"
                type="text"
                {...register("national_id")}
                error={!!errors.national_id}
                success={!!errors.national_id && !errors.national_id?.message}
                hint={errors.national_id?.message}
                disabled={pending}
              />
            </div>

            <div>
              <Label>
                Branch <span className="text-error-500">*</span>
              </Label>

              <Select
                options={(branches ?? []).map(b => ({
                  value: String(b.id),
                  label: b.name
                }))}
                placeholder='Select Branch'
                {...register("branch_id")}
                error={!!errors.branch_id}
                disabled={pending}
              />
              {errors.branch_id && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.branch_id.message}
                </p>
              )}

            </div>

            <div>
              <Label>
                Role <span className="text-error-500">*</span>
              </Label>
              <Select
                options={USER_ROLES}
                placeholder="Select Role"
                {...register("role")}
                error={!!errors.role}
                disabled={pending}
              />
              {errors.role && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.role.message}
                </p>
              )}
            </div>
            <div>
              <Label>
                Status <span className="text-error-500">*</span>
              </Label>
              <Select
                options={USER_STATUSES}
                placeholder="Select Status"
                {...register("status")}
                error={!!errors.status}
                disabled={pending}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.status.message}
                </p>
              )}
            </div>
            <div>
              <Label>
                Password (Leave blank to keep current)
              </Label>
              <Input
                placeholder="Password"
                type="text"
                {...register("password")}
                error={!!errors.password}
                hint={errors.password?.message}
                disabled={pending}
              />
            </div>
          </div>
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="animate-spin" size="20" />
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}