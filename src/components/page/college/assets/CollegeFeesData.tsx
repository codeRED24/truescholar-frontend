import { FeeDTO } from "@/api/@types/college-info";
import { formatFeeRange } from "@/components/utils/utils";
import React from "react";

interface CollegeFeesDataProps {
  data: FeeDTO[];
}

const CollegeFeesData: React.FC<CollegeFeesDataProps> = ({ data }) => {
  return (
    <div>
      {data.map(({ fee_id, course_group_name, duration, ...fee }) => {
        const feesDetails = [
          {
            label: "Tuition",
            description:
              "Tuition fee is calculated on the basis of 1st year/semester. Actual amount may vary.",
            feeRange: [fee.total_tution_fees_min, fee.total_tution_fees_max],
          },
          {
            label: "One Time Payment",
            description:
              "One time payment includes Admission fees (Non Refundable), Student welfare fund (Non Refundable), Institute Security Deposits (Refundable), Library Security Deposits (Refundable).",
            feeRange: [fee.min_one_time_fees, fee.max_one_time_fees],
          },
          {
            label: "Hostel",
            description:
              "Hostel fee is calculated on the basis of 1st semester. Actual amount may vary. The fees might include components other than hostel fees. Meal Plan is included in mentioned fee.",
            feeRange: [fee.min_hostel_fees, fee.max_hostel_fees],
          },
          {
            label: "Other Fees",
            description:
              "Tuition fee is calculated on the basis of 1st year/semester. Actual amount may vary.",
            feeRange: [fee.min_other_fees, fee.max_other_fees],
          },
        ];

        return (
          <div key={fee_id} className="mb-6 article-content-body" id={`pdf-table-${fee_id}`}>
            <h4 className="text-base md:text-xl font-semibold md:font-bold py-4 px-1">
              <span className="text-primary-main">{course_group_name} </span>Fees Details for 2025
            </h4>
            <div className="rounded-2xl overflow-auto border border-[#00A76F29]">
              <table className="couse-table rounded-2xl mb-0">
                <thead>
                  <tr className="bg-[#00A76F14] text-[#007867] rounded-t-2xl border-b border-dashed border-[#DFE3E8] ">
                    <th className="font-semibold text-sm">Particulars</th>
                    <th className="font-semibold text-sm">Amount for {duration}</th>
                  </tr>
                </thead>
                <tbody>
                  {feesDetails.map(({ label, description, feeRange }) => (
                    <tr key={label} className="border-b border-dashed border-[#DFE3E8]">
                      <td className="text-sm font-semibold">
                        {label}
                        <span className="block leading-4 md:leading-5 font-light text-xs text-gray-6">
                          {description}
                        </span>
                      </td>
                      <td>{formatFeeRange(feeRange[0], feeRange[1])}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#00A76F14]">
                    <td className="text-base font-semibold">Total Fees</td>
                    <td className="text-base font-semibold">
                      {formatFeeRange(fee.total_min_fees, fee.total_max_fees)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CollegeFeesData);
