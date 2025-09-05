import React from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfileStore } from "../../stores/profileStore";
import {
  basicDetailsSchema,
  BasicDetailsFormData,
} from "../../lib/validation-schemas";
import { Edit, Save, X } from "lucide-react";

const BasicDetails = () => {
  const {
    basicDetails,
    isEditing,
    isLoading,
    error,
    setIsEditing,
    setBasicDetails,
    saveProfile,
  } = useProfileStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BasicDetailsFormData>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: basicDetails,
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset(basicDetails);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(basicDetails);
  };

  const onSubmit = async (data: BasicDetailsFormData) => {
    setBasicDetails(data);
    await saveProfile();
  };

  return (
    <div className="grid grid-cols-1 gap-4 grid-flow-dense">
      {/* 1st card */}
      <Card className="bg-white shadow p-4 rounded-2xl relative">
        {/* Edit Button - Top Right Corner */}
        <div className="absolute top-4 right-4 z-10">
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-[#7b61ff] hover:text-[#5a41c8] hover:bg-[#f3f0ff]"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start w-full bg-white gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 rounded-full bg-[#d1c4e9] overflow-hidden">
            <Avatar className="w-32 h-32">
              <AvatarImage alt="" src={"/avatar.png"} />
              <AvatarFallback className="text-3xl font-bold">
                {basicDetails?.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col justify-between h-full w-full">
            {!isEditing ? (
              // View Mode
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {basicDetails.name}
                </h2>
                <div className="text-gray-500 text-sm mb-1">
                  <span className="font-medium text-gray-400">
                    Registration Date:
                  </span>{" "}
                  <span className="text-gray-700">{basicDetails.date}</span>
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  <span className="font-medium text-gray-400">
                    Country, City:
                  </span>{" "}
                  <span className="text-gray-700">{basicDetails.country}</span>
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  <span className="font-medium text-gray-400">Birthday:</span>{" "}
                  <span className="text-gray-700">{basicDetails.birthday}</span>
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  <span className="font-medium text-gray-400">E-mail:</span>{" "}
                  <span className="text-gray-700">{basicDetails.email}</span>
                </div>
                <div className="text-gray-500 text-sm mb-1">
                  <span className="font-medium text-gray-400">Phone:</span>{" "}
                  <span className="text-gray-700">{basicDetails.phone}</span>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country, City
                  </label>
                  <Input
                    {...register("country")}
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birthday
                  </label>
                  <Input
                    {...register("birthday")}
                    placeholder="DD.MM.YYYY"
                    className={errors.birthday ? "border-red-500" : ""}
                  />
                  {errors.birthday && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.birthday.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
              </form>
            )}

            {/* Social icons - only show in view mode */}
            {!isEditing && (
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="text-[#7b61ff] hover:text-[#5a41c8]"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-[#7b61ff] hover:text-[#5a41c8]"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-[#7b61ff] hover:text-[#5a41c8]"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-[#7b61ff] hover:text-[#5a41c8]"
                  aria-label="VK"
                >
                  <i className="fab fa-vk text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-[#7b61ff] hover:text-[#5a41c8]"
                  aria-label="Telegram"
                >
                  <i className="fab fa-telegram-plane text-2xl"></i>
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BasicDetails;
