import { Link } from "react-router-dom"


function PictureProfile() {
    return (
        <>
            <Link to="/profile-settings">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold cursor-pointer border-2 border-blue-500">
                    NH
                </div>
            </Link >
        </>
    )
}

export default PictureProfile