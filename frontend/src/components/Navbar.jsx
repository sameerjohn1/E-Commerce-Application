import { useEffect, useState } from "react";
import { navbarStyles } from "../assets/dummyStyles";
import { BaggageClaim, Clock, Menu, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Watches", href: "/watches" },
  { name: "Contact", href: "/contact" },
  { name: "My Orders", href: "/my-orders" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(location.pathname || "/");

  const { totalItems, clearCart, reloadCart } = useCart();
  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      return (
        localStorage.getItem("isLoggedIn") === "true" ||
        !!localStorage.getItem("authToken")
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setActive(location.pathname || "/");
  }, [location]);

  //   to keep user logged in for all pages
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "isLoggedIn" || e.key === "authToken") {
        try {
          const isNowLoggedIn =
            localStorage.getItem("isLoggedIn") === "true" ||
            !!localStorage.getItem("authToken");
          setLoggedIn(isNowLoggedIn);
        } catch {
          setLoggedIn(false);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleNavClick = (href) => {
    setActive(href);
    setOpen(false);
  };

  useEffect(() => {
    try {
      reloadCart();
    } catch (e) {
      // ignore
    }
  }, [loggedIn]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("authToken");
      location.removeItem("user");
      localStorage.removeItem("cart");
      localStorage.removeItem("cartItems");
    } catch (e) {}

    try {
      clearCart && clearCart();
    } catch (e) {
      // ignore
    }
    setLoggedIn(false);
    setOpen(false);
    navigate("/");
  };
  return (
    <header className={navbarStyles.header}>
      <nav className={navbarStyles.nav} role="navigation">
        <div className={navbarStyles.container}>
          {/* brand logo */}
          <div className={navbarStyles.brandContainer}>
            <div className={navbarStyles.logoContainer}>
              <Clock className={navbarStyles.logoIcon} />
            </div>
            <Link
              to={"/"}
              onClick={() => handleNavClick("/")}
              className={navbarStyles.logoLink}
            >
              <span
                style={navbarStyles.logoTextStyle}
                className={navbarStyles.logoText}
              >
                ChronoElite
              </span>
            </Link>
          </div>

          {/* Desktop navigations */}
          <div className={navbarStyles.desktopNav}>
            {navItems.map((item) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handleNavClick("/")}
                  className={`${navbarStyles.navItemBase} ${
                    isActive
                      ? navbarStyles.navItemActive
                      : navbarStyles.navItemInactive
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`${navbarStyles.activeIndicator} ${
                      isActive
                        ? navbarStyles.activeIndicatorVisible
                        : navbarStyles.activeIndicatorHidden
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className={navbarStyles.rightActions}>
            <Link to={"/cart"} className={navbarStyles.cartLink}>
              <BaggageClaim className={navbarStyles.cartIcon} />
              {totalItems > 0 && (
                <span className={navbarStyles.cartBadge}>{totalItems}</span>
              )}
            </Link>

            {!loggedIn ? (
              <Link to={"/login"} className={navbarStyles.accountLink}>
                <User className={navbarStyles.accountIcon} />
                <span className={navbarStyles.accountText}>Account</span>
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className={navbarStyles.accountLink}
              >
                <User className={navbarStyles.accountIcon} />
                <span className={navbarStyles.accountText}>Logout</span>
              </button>
            )}

            {/* mobile toggle */}
            <div className={navbarStyles.mobileMenuButton}>
              <button
                onClick={() => setOpen(!open)}
                className={navbarStyles.mobileMenuButton}
              >
                {open ? (
                  <X className={navbarStyles.menuIcon} />
                ) : (
                  <Menu className={navbarStyles.menuIcon} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* mobile navigation */}
        {open && (
          <div className={navbarStyles.mobileNav}>
            <div className={navbarStyles.mobileMenuContainer}>
              {navItems.map((item) => {
                const isActive = active === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`${navbarStyles.mobileNavItemBase} ${
                      isActive
                        ? navbarStyles.mobileNavItemActive
                        : navbarStyles.mobileNavItemInactive
                    }`}
                  >
                    <span className={navbarStyles.mobileNavItemText}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              <div className={navbarStyles.mobileAccountContainer}>
                {!loggedIn ? (
                  <Link
                    to={"/login"}
                    onClick={() => {
                      setOpen(false);
                      handleNavClick("/");
                    }}
                    className={navbarStyles.mobileAccountLink}
                  >
                    <User className={navbarStyles.mobileAccountIcon} />
                    <span>Account</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    className={navbarStyles.mobileAccountButton}
                  >
                    <User className={navbarStyles.mobileAccountIcon} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
