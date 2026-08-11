import hostelBg from "../../assets/hostel-bg.png";

function HeroSection({ onExplore }) {
  return (
    <section
      className="hostel-hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)), url(${hostelBg})`,
      }}
    >
      <div className="hero-content">
        <h1>
          Welcome To
          <br />
          CampusNest Hostel
        </h1>

        <p>
          Safe • Secure • Comfortable Student Accommodation
          <br />
          with Modern Facilities for Boys and Girls.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={onExplore}>
            Explore Hostel
          </button>

          <button className="btn-outline">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;