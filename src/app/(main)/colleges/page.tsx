import dynamic from 'next/dynamic';
import React from 'react';


const CollegeList = dynamic(() => import('@/components/page/college/CollegeList'), {
  loading: () => <div className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32" />
});

const Colleges = () => {
  return (
    <div>
      <CollegeList />
    </div>
  );
};

export default Colleges;
