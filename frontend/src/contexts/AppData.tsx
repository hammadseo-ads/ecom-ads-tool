import AppDataContext from "./AppDataContext";
import { useContext } from "react";
const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
};
export  {useAppData} ;