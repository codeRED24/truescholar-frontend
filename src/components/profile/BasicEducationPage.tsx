import React, { useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfileStore } from "../../stores/profileStore";
import { z } from "zod";
import { Save, Edit2, BookOpen } from "lucide-react";
import { SuggestionInput } from "../ui/suggestion-input";

const collegeSchema = z.object({
  college: z.string().min(1, "College name is required"),
});

type CollegeFormData = z.infer<typeof collegeSchema>;

const BasicEducationPage = () => {
  const {
    basicDetails,
    isEditing,
    isLoading,
    error,
    setBasicDetails,
    setIsEditing,
    saveProfile,
  } = useProfileStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CollegeFormData>({
    resolver: zodResolver(collegeSchema),
    defaultValues: {
      college: basicDetails.college || "",
    },
  });

  React.useEffect(() => {
    if (isEditing) {
      setValue("college", basicDetails.college || "");
    }
  }, [isEditing, basicDetails.college, setValue]);

  const fetchCollegeSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      try {
        const url = `${
          process.env.NEXT_PUBLIC_API_URL
        }/college-search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const colleges = data.data.colleges || [];

        return colleges.map(
          (college: any) => college.college_name || college.name
        );
      } catch (error) {
        console.error("Error fetching college suggestions:", error);
        return [];
      }
    },
    []
  );

  const handleCollegeSelect = (collegeName: string) => {
    setValue("college", collegeName, { shouldValidate: true });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({ college: basicDetails.college || "" });
  };

  const onSubmit = async (data: CollegeFormData) => {
    setBasicDetails({ college: data.college });
    await saveProfile();
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-white shadow p-6 rounded-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-[#7b61ff] hover:text-[#5a41c8] hover:bg-[#f3f0ff]"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College/University
              </label>
              <Controller
                name="college"
                control={control}
                render={({ field }) => (
                  <SuggestionInput
                    {...field}
                    placeholder="Search and select your college"
                    fetchSuggestions={fetchCollegeSuggestions}
                    onSelect={handleCollegeSelect}
                    className={errors.college ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.college && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.college.message}
                </p>
              )}
            </div>

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
          <div>
            {basicDetails.college ? (
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#7b61ff] rounded-full flex items-center justify-center mr-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#7b61ff]" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {basicDetails.college}
                  </h4>
                  <p className="text-gray-600">College/University</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2">
                  No education details added
                </p>
                <p className="text-sm">
                  Click "Edit" to add your college or university.
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded mt-6">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BasicEducationPage;
