import { useEffect } from "react"
import api from "../services/api"

function Dashboard() {

  useEffect(() => {

    const getDashboard = async() => {
      try {
        const response = await api.get("/dashboard/summary");
        console.log(response.data)

      } catch (error) {
        console.log(error)
      }
    };

    getDashboard();

  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}

export default Dashboard
