import SignupForm from "@/components/SignupForm";
import StaticContent from "@/components/StaticContent";

const Singup = () => {
  return (
    <div className="flex w-full h-screen">
      <StaticContent />
      <div className="flex flex-1 items-center justify-center">
        <SignupForm />
      </div>
    </div>
  )
}

export default Singup
