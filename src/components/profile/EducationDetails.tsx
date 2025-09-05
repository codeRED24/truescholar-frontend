import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEducationStore } from "../../stores/profileStore";
import {
  educationDetailsSchema,
  EducationDetailsFormData,
} from "../../lib/validation-schemas";
import {
  Save,
  Plus,
  Trash,
  Edit2,
  BookOpen,
  Award,
  Calendar,
} from "lucide-react";
import { Textarea } from "../ui/textarea";

const EducationDetails = () => {
  const {
    educationDetails,
    isEditing,
    isLoading,
    error,
    setIsEditing,
    addEducationDetail,
    updateEducationDetail,
    removeEducationDetail,
    saveEducation,
  } = useEducationStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EducationDetailsFormData>({
    resolver: zodResolver(educationDetailsSchema),
  });

  // Sort education by graduation year (most recent first for timeline)
  const sortedEducation = [...(educationDetails || [])].sort((a, b) => {
    const yearA = parseInt(a.graduationYear);
    const yearB = parseInt(b.graduationYear);
    return yearB - yearA; // Most recent first
  });

  const handleAddNew = () => {
    const newEdu: EducationDetailsFormData = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      graduationYear: "",
      grade: "",
      activities: "",
    };
    addEducationDetail(newEdu);
    setEditingId(newEdu.id);
    reset(newEdu);
  };

  const handleEdit = (edu: any) => {
    setEditingId(edu.id);
    setValue("id", edu.id);
    setValue("institution", edu.institution);
    setValue("degree", edu.degree);
    setValue("fieldOfStudy", edu.fieldOfStudy);
    setValue("graduationYear", edu.graduationYear);
    setValue("grade", edu.grade || "");
    setValue("activities", edu.activities || "");
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: EducationDetailsFormData) => {
    updateEducationDetail(data.id, data);
    setEditingId(null);
    setIsEditing(false);
    await saveEducation();
  };

  const handleDelete = (id: string) => {
    removeEducationDetail(id);
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-white shadow p-6 rounded-2xl relative">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Education Details
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNew}
            className="text-[#7b61ff] hover:text-[#5a41c8] hover:bg-[#f3f0ff]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        </div>

        {/* Timeline Container */}
        <div className="space-y-6">
          {sortedEducation.map((edu) => (
            <div key={edu.id} className="relative">
              {editingId === edu.id ? (
                // Edit Mode
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input type="hidden" {...register("id")} />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution
                      </label>
                      <Input
                        {...register("institution")}
                        className={errors.institution ? "border-red-500" : ""}
                      />
                      {errors.institution && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.institution.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <Input
                        {...register("degree")}
                        className={errors.degree ? "border-red-500" : ""}
                      />
                      {errors.degree && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.degree.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field of Study
                      </label>
                      <Input
                        {...register("fieldOfStudy")}
                        className={errors.fieldOfStudy ? "border-red-500" : ""}
                      />
                      {errors.fieldOfStudy && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fieldOfStudy.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year
                      </label>
                      <Input
                        {...register("graduationYear")}
                        placeholder="YYYY"
                        className={
                          errors.graduationYear ? "border-red-500" : ""
                        }
                      />
                      {errors.graduationYear && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.graduationYear.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade (Optional)
                    </label>
                    <Input
                      {...register("grade")}
                      className={errors.grade ? "border-red-500" : ""}
                    />
                    {errors.grade && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.grade.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activities (Optional)
                    </label>
                    <Textarea
                      {...register("activities")}
                      rows={3}
                      className={errors.activities ? "border-red-500" : ""}
                    />
                    {errors.activities && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.activities.message}
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
                        <BookOpen className="w-5 h-5 text-[#7b61ff]" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <div className="bg-gray-50 rounded-lg p-4 mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {edu.degree}
                          </h4>
                          <p className="text-[#7b61ff] font-medium">
                            {edu.institution}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(edu)}
                            className="text-[#7b61ff] hover:text-[#5a41c8] hover:bg-[#f3f0ff]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(edu.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Field of Study */}
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{edu.fieldOfStudy}</span>
                      </div>

                      {/* Graduation Year */}
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Graduated {edu.graduationYear}</span>
                      </div>

                      {/* Grade */}
                      {edu.grade && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Grade:</span>{" "}
                          <span className="text-gray-700">{edu.grade}</span>
                        </div>
                      )}

                      {/* Activities */}
                      {edu.activities && (
                        <div className="text-sm text-gray-700 mt-3">
                          <p className="font-medium mb-1">Activities:</p>
                          <p>{edu.activities}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {(educationDetails || []).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-2">
                No education details added
              </p>
              <p className="text-sm">
                Click "Add Education" to build your academic timeline.
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

export default EducationDetails;
