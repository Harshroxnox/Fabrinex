import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "./contexts/LoginContext";

const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useContext(LoginContext);
    if(!isAuthenticated){
        //if not logged in , redirect to login page
        return < Navigate to="/" replace />
    }
    return children;
};

export default ProtectedRoute;