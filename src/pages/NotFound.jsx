import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <div className="notfound d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h1>Eror 404</h1>
          <Link to="/">
            <button className="btn btn-primary"> الرئيسية </button>
          </Link>
        </div>
      </div>
    </>
  );
}
