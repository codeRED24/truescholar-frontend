"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReview, ReviewDetail } from "../../../../api/reviews/getReview";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  GraduationCap,
  Star,
  DollarSign,
  Award,
  Users,
  BookOpen,
  Building,
  UserCheck,
  Home,
  Gamepad2,
  Linkedin,
  FileText,
} from "lucide-react";
import Link from "next/link";

const ReviewDetailPage = () => {
  const params = useParams();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const reviewData = await getReview(Number(params.id));
        setReview(reviewData);
      } catch (err) {
        setError("Failed to load review");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading review...</div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Review not found"}</div>
      </div>
    );
  }

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link href="/profile">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        {/* Main Review Card */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {review.review_title}
              </h1>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(review.created_at).toLocaleDateString()}
              </div>
              {review.college && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-1" />
                  {review.college.college_name}
                </div>
              )}
              {review.linkedin_profile && (
                <div className="flex items-center text-sm text-gray-600">
                  <Linkedin className="w-4 h-4 mr-1" />
                  <a
                    href={review.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                review.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : review.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {review.status}
            </div>
          </div>

          {/* Overall Experience */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Overall Experience</h3>
            {review.overall_satisfaction_rating && (
              <div className="mb-2">
                {renderRating(review.overall_satisfaction_rating)}
              </div>
            )}
            <p className="text-gray-700">
              {review.overall_experience_feedback}
            </p>
          </div>

          {/* College and Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {review.college && (
              <div className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">College</p>
                  <p className="font-medium">{review.college.college_name}</p>
                </div>
              </div>
            )}
            {review.collegeCourse && (
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{review.collegeCourse.name}</p>
                </div>
              </div>
            )}
            {review.college_location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{review.college_location}</p>
                </div>
              </div>
            )}
            {review.pass_year && (
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Pass Year</p>
                  <p className="font-medium">{review.pass_year}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Ratings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Academic Experience
            </h3>
            <div className="space-y-4">
              {review.teaching_quality_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teaching Quality</p>
                  {renderRating(review.teaching_quality_rating)}
                  {review.teaching_quality_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.teaching_quality_feedback}
                    </p>
                  )}
                </div>
              )}
              {review.infrastructure_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Infrastructure</p>
                  {renderRating(review.infrastructure_rating)}
                  {review.infrastructure_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.infrastructure_feedback}
                    </p>
                  )}
                </div>
              )}
              {review.library_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Library</p>
                  {renderRating(review.library_rating)}
                  {review.library_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.library_feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Support & Facilities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Support & Facilities
            </h3>
            <div className="space-y-4">
              {review.placement_support_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Placement Support
                  </p>
                  {renderRating(review.placement_support_rating)}
                  {review.placement_support_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.placement_support_feedback}
                    </p>
                  )}
                </div>
              )}
              {review.administrative_support_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Administrative Support
                  </p>
                  {renderRating(review.administrative_support_rating)}
                  {review.administrative_support_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.administrative_support_feedback}
                    </p>
                  )}
                </div>
              )}
              {review.hostel_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hostel</p>
                  {renderRating(review.hostel_rating)}
                  {review.hostel_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.hostel_feedback}
                    </p>
                  )}
                </div>
              )}
              {review.extracurricular_rating && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Extracurricular</p>
                  {renderRating(review.extracurricular_rating)}
                  {review.extracurricular_feedback && (
                    <p className="text-sm text-gray-700 mt-1">
                      {review.extracurricular_feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Financial Information */}
        {(review.annual_tuition_fees ||
          review.hostel_fees ||
          review.scholarship_availed ||
          review.other_charges) && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {review.annual_tuition_fees && (
                <div>
                  <p className="text-sm text-gray-600">Annual Tuition Fees</p>
                  <p className="font-medium">
                    ₹{review.annual_tuition_fees.toLocaleString()}
                  </p>
                </div>
              )}
              {review.hostel_fees && (
                <div>
                  <p className="text-sm text-gray-600">Hostel Fees</p>
                  <p className="font-medium">
                    ₹{review.hostel_fees.toLocaleString()}
                  </p>
                </div>
              )}
              {review.scholarship_availed && (
                <div>
                  <p className="text-sm text-gray-600">Scholarship</p>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-1 text-green-500" />
                    <span className="font-medium">
                      {review.scholarship_name || "Scholarship Availed"}
                      {review.scholarship_amount &&
                        ` (₹${review.scholarship_amount.toLocaleString()})`}
                    </span>
                  </div>
                </div>
              )}
              {review.other_charges && (
                <div>
                  <p className="text-sm text-gray-600">Other Charges</p>
                  <p className="font-medium">
                    ₹{review.other_charges.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Documents */}
        {/* {(review.degree_certificate_url ||
          review.mark_sheet_url ||
          review.student_id_url) && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documents
            </h3>
            <div className="space-y-2">
              {review.degree_certificate_url && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <a
                    href={review.degree_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Degree Certificate
                  </a>
                </div>
              )}
              {review.mark_sheet_url && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <a
                    href={review.mark_sheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Mark Sheet
                  </a>
                </div>
              )}
              {review.student_id_url && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <a
                    href={review.student_id_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Student ID
                  </a>
                </div>
              )}
            </div>
          </Card>
        )} */}

        {/* Improvement Suggestions */}
        {review.improvement_suggestions && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2">
              Improvement Suggestions
            </h3>
            <p className="text-gray-700">{review.improvement_suggestions}</p>
          </Card>
        )}

        {/* College Images */}
        {review.college_images_urls &&
          review.college_images_urls.length > 0 && (
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">College Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {review.college_images_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`College image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </Card>
          )}
      </div>
    </div>
  );
};

export default ReviewDetailPage;
