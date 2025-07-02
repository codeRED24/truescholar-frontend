import { CollegeDateDTO } from "@/api/@types/college-info";
import UpdateModal from "@/components/modals/UpdateModal";
import { formatDate } from "@/components/utils/formatDate";
import { formatDateYearMonth } from "@/components/utils/utils";
import React, { memo, useMemo } from "react";
import { LuBellRing as BellRing } from "react-icons/lu";

const getDateString = (date: string) => new Date(date).toDateString();
const getMonthYear = (date: string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const areDatesEqual = (startDate: string, endDate: string) =>
  getDateString(startDate) === getDateString(endDate);

const areMonthsEqual = (startDate: string, endDate: string) =>
  getMonthYear(startDate) === getMonthYear(endDate);

const formatDateDisplay = (date: string, isConfirmed: boolean) =>
  isConfirmed ? formatDate(date) : formatDateYearMonth(date);

const getStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const nowDate = now.setHours(0, 0, 0, 0);
  const startDateMs = start.setHours(0, 0, 0, 0);
  const endDateMs = end.setHours(0, 0, 0, 0);

  if (nowDate < startDateMs) {
    return (
      <span className="rounded-full px-3 bg-primary-1 text-black text-xxs font-normal uppercase">
        Tentative
      </span>
    );
  }
  if (nowDate >= startDateMs && nowDate <= endDateMs) {
    return (
      <span className="rounded-full px-3 bg-gray-7 text-white text-xxs font-light uppercase">
        Ongoing
      </span>
    );
  }
  return null;
};

type CutoffDatesTableProps = {
  data: CollegeDateDTO[];
};

const CutoffDatesTable: React.FC<CutoffDatesTableProps> = memo(({ data }) => {
  if (!data?.length) return null;

  const formatDateForDisplay = useMemo(
    () => (cutoff: CollegeDateDTO) => {
      const { start_date, end_date, is_confirmed } = cutoff;

      if (areDatesEqual(start_date, end_date)) {
        return formatDateDisplay(start_date, is_confirmed);
      }
      if (!is_confirmed && areMonthsEqual(start_date, end_date)) {
        return formatDateYearMonth(start_date);
      }
      return `${formatDateDisplay(
        start_date,
        is_confirmed
      )} - ${formatDateDisplay(end_date, is_confirmed)}`;
    },
    []
  );

  const tableRows = useMemo(
    () =>
      data.map((cutoff, index) => (
        <tr key={cutoff.college_dates_id || index} className="whitespace-pre">
          <td>{cutoff.event}</td>
          <td className="flex items-center justify-between gap-4">
            <span>{formatDateForDisplay(cutoff)}</span>
            {getStatus(cutoff.start_date, cutoff.end_date)}
          </td>
        </tr>
      )),
    [data, formatDateForDisplay]
  );

  return (
    <div className="article-content-body">
      <div className="flex items-center justify-between mb-2">
        <h2 className="content-title">
          Important <span className="text-primary-main">Events </span>
          and <span className="text-primary-main">Key Dates</span>
        </h2>
        <UpdateModal
          triggerText={
            <>
              Notify me <BellRing size={14} fill="#fff" className="rotate-45" />
            </>
          }
        />
      </div>
      <div className="table-container-e">
        <table>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    </div>
  );
});

CutoffDatesTable.displayName = "CutoffDatesTable";

export default CutoffDatesTable;
