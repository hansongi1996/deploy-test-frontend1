import { useNavigate } from "react-router-dom";

const Mainpage = () => {
    const navigate = useNavigate();

    const handleAdmin = () => {
        navigate('/admin');
    }
    
    return (
        <div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={handleAdmin}>관리자페이지</button>
        </div>
    );
};

export default Mainpage;

