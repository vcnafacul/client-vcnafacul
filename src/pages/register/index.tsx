import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import RegisterForm from "../../components/organisms/registerForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import { registerForm } from "./data";

function Register() {
  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen"
    >
      <div className="relative py-4">
        <TriangleGreen className="graphism triangle-green" />
        <TriangleYellow className="graphism triangle-yellow" />
        <RegisterForm
          formData={registerForm.formData}
          title={registerForm.title}
          titleSuccess={registerForm.titleSuccess}
        />
        {/* register form */}
      </div>
    </BaseTemplate>
  );
}

export default Register;
