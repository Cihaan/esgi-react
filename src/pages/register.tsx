import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { authService } from "../services/auth-service";

const Register = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const initialValues = {
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    firstname: Yup.string().required("Prénom requis"),
    lastname: Yup.string().required("Nom requis"),
    username: Yup.string().required("Nom d'utilisateur requis"),
    email: Yup.string().email("Email invalide").required("Email requis"),
    password: Yup.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").required("Mot de passe requis"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Les mots de passe doivent correspondre")
      .required("Confirmation du mot de passe requise"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setError("");
    setSuccess("");

    const result = authService.register(values.firstname, values.lastname, values.username, values.email, values.password);
    if (result.success) {
      setSuccess("Inscription réussie. Redirection vers la page de connexion...");
      setTimeout(() => {
        navigate("/login");
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
          <h1 className="text-5xl font-bold">Inscription</h1>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="card-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-control">
                  <label className="label" htmlFor="firstname">
                    <span className="label-text">Prénom</span>
                  </label>
                  <Field type="text" name="firstname" placeholder="Prénom" className="input input-bordered" />
                  <ErrorMessage name="firstname" component="div" className="text-error text-sm mt-1" />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="lastname">
                    <span className="label-text">Nom</span>
                  </label>
                  <Field type="text" name="lastname" placeholder="Nom" className="input input-bordered" />
                  <ErrorMessage name="lastname" component="div" className="text-error text-sm mt-1" />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="username">
                    <span className="label-text">Nom d'utilisateur</span>
                  </label>
                  <Field type="text" name="username" placeholder="Nom d'utilisateur" className="input input-bordered" />
                  <ErrorMessage name="username" component="div" className="text-error text-sm mt-1" />
                </div>

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
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="confirmPassword">
                    <span className="label-text">Confirmer le mot de passe</span>
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="confirmer le mot de passe"
                    className="input input-bordered"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-error text-sm mt-1" />
                </div>

                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    S'inscrire
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="text-center mt-4">
          <p>
            Déjà un compte?{" "}
            <Link to="/login" className="link link-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
