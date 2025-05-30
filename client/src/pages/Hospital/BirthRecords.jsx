import { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/UserContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axoisInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import RecordListTabel from "../../components/RecordsTable";
import { LuSquarePlus } from "react-icons/lu";
import { Link } from "react-router-dom";

function BirthRecords() {
  useUserAuth();

  const { user } = useContext(UserContext);

  const [birthRecordsData, setBirthRecordsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getBirthRecords = async () => {
    try {
      const response = await axoisInstance.get(API_PATHS.RECORDS.HOSPITAL.GET_ALL_BIRTH_RECORDS);

      if (response.data) {
        setBirthRecordsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBirthRecords();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Birth Records">
      <div className="card my-5">
        <div className="flex items-center justify-between">
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">Hello, {user?.fullName}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>

          <Link to={"/hospital/add-birth"} className="flex download-btn">
            <LuSquarePlus className="text-lg" />
            Add Birth Record
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap6 my-4 md:my-6">
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="text-lg md:text-xl font-medium mb-6">Birth Records</h3>
            <RecordListTabel
              tableData={birthRecordsData || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BirthRecords;
