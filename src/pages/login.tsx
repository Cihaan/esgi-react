import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { authService } from "../services/auth-service";

const Login = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Email invalide").required("Email requis"),
    password: Yup.string().required("Mot de passe requis"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setError("");
    setSuccess("");

    const result = authService.login(values.email, values.password);
    if (result.success) {
      setSuccess("Connexion réussie. Redirection...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Connexion</h1>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="card-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-control">
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email</span>
                  </label>
                  <Field type="email" name="email" placeholder="email" className="input input-bordered" />
                  <ErrorMessage name="email" component="div" className="text-error text-sm mt-1" />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="password">
                    <span className="label-text">Mot de passe</span>
                  </label>
                  <Field type="password" name="password" placeholder="mot de passe" className="input input-bordered" />
                  <ErrorMessage name="password" component="div" className="text-error text-sm mt-1" />
                  <label className="label">
                    <Link to="/forgot-password" className="label-text-alt link link-hover">
                      Mot de passe oublié?
                    </Link>
                  </label>
                </div>

                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    Se connecter
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="text-center mt-4">
          <p>
            Pas encore de compte?{" "}
            <Link to="/register" className="link link-primary">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
