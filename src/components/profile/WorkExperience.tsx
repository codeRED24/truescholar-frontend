import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWorkExperienceStore } from "../../stores/profileStore";
import {
  workExperienceSchema,
  WorkExperienceFormData,
} from "../../lib/validation-schemas";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash,
  Edit2,
  MapPin,
  Calendar,
} from "lucide-react";
import { Textarea } from "../ui/textarea";

const WorkExperience = () => {
  const {
    workExperience,
    isEditing,
    isLoading,
    error,
    setIsEditing,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    saveWorkExperience,
  } = useWorkExperienceStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
  });

  // Sort work experiences by start date (most recent first for timeline)
  const sortedWorkExperiences = [...workExperience].sort((a, b) => {
    const dateA = new Date(a.startDate.replace(".", "-"));
    const dateB = new Date(b.startDate.replace(".", "-"));
    return dateB.getTime() - dateA.getTime();
  });

  const handleAddNew = () => {
    const newExp: WorkExperienceFormData = {
      id: `work-${Date.now()}`,
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      location: "",
    };
    addWorkExperience(newExp);
    setEditingId(newExp.id);
    reset(newExp);
  };

  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    setValue("id", exp.id);
    setValue("company", exp.company);
    setValue("position", exp.position);
    setValue("startDate", exp.startDate);
    setValue("endDate", exp.endDate);
    setValue("description", exp.description || "");
    setValue("location", exp.location || "");
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: WorkExperienceFormData) => {
    updateWorkExperience(data.id, data);
    setEditingId(null);
    setIsEditing(false);
    await saveWorkExperience();
  };

  const handleDelete = (id: string) => {
    removeWorkExperience(id);
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-white shadow p-6 rounded-2xl relative">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Work Experience
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNew}
            className="text-[#7b61ff] hover:text-[#5a41c8] hover:bg-[#f3f0ff]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        </div>

        {/* Timeline Container */}
        <div className="space-y-6">
          {sortedWorkExperiences.map((exp, index) => (
            <div key={exp.id} className="relative">
              {editingId === exp.id ? (
                // Edit Mode
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...register("id")} />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <Input
                        {...register("company")}
                        className={errors.company ? "border-red-500" : ""}
                      />
                      {errors.company && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.company.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <Input
                        {...register("position")}
                        className={errors.position ? "border-red-500" : ""}
                      />
                      {errors.position && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.position.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <Input
                        {...register("startDate")}
                        placeholder="MM.YYYY"
                        className={errors.startDate ? "border-red-500" : ""}
                      />
                      {errors.startDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <Input
                        {...register("endDate")}
                        placeholder="MM.YYYY or Present"
                        className={errors.endDate ? "border-red-500" : ""}
                      />
                      {errors.endDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location (Optional)
                    </label>
                    <Input
                      {...register("location")}
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <Textarea
                      {...register("description")}
                      rows={4}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                // View Mode - Timeline Style
                <div className="flex relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 bg-[#7b61ff] rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-[#7b61ff] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <div className="bg-gray-50 rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {exp.position}
                          </h4>
                          <p className="text-[#7b61ff] font-medium">
                            {exp.company}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(exp)}
                            className="text-[#7b61ff] hover:text-[#5a41c8] hover:bg-[#f3f0ff]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {exp.startDate} - {exp.endDate}
                        </span>
                      </div>

                      {/* Location */}
                      {exp.location && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{exp.location}</span>
                        </div>
                      )}

                      {/* Description */}
                      {exp.description && (
                        <div className="text-sm text-gray-700 mt-3">
                          <p>{exp.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {workExperience.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">
                No work experience added
              </p>
              <p className="text-sm">
                Click "Add Experience" to build your professional timeline.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded mt-6">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkExperience;
