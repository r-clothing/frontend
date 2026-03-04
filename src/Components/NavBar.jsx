import { Link } from 'react-router-dom';
import '../index.css';
import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

export default function NavBar({ toggle, menuOpen }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    return (
        <nav className='fixed top-0 left-0 w-full px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-gray-300/40 z-50'>

            <div className='flex items-center space-x-4 sm:space-x-6 md:space-x-8'>

                <button
                    onClick={toggle}
                    className="relative w-4 h-4 flex items-center justify-center group cursor-pointer transition"
                >
                    <span
                        className={`absolute w-4 bg-gray-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${menuOpen
                                ? "h-[1px] rotate-45"
                                : "h-[0.8px] -translate-y-[5px]"
                            }
                        `}
                    />

                    <span
                        className={`absolute w-4 bg-gray-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${menuOpen
                                ? "h-[1px] opacity-0"
                                : "h-[0.8px] opacity-100"
                            }
                        `}
                    />

                    <span
                        className={`absolute w-4 bg-gray-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${menuOpen
                                ? "h-[1px] -rotate-45"
                                : "h-[0.8px] translate-y-[5px]"
                            }
                        `}
                    />
                </button>

                <Link
                    to="/"
                    style={{ fontFamily: "'Bodoni Moda', serif" }}
                    className="text-sm tracking-wide"
                >
                    R
                </Link>

            </div>

            <div className='flex items-center space-x-8'>
                <ul className='flex space-x-6 items-center mono-font'>
                    <li>
                        {user ? (
                            <Link className="text-xs sm:text-sm tracking-wide hover:text-gray-500 transition-colors duration-200" to='/profile'>
                                PROFILE
                            </Link>
                        ) : (
                            <Link className="text-xs sm:text-sm tracking-wide hover:text-gray-500 transition-colors duration-200" to='/login'>
                                LOGIN
                            </Link>
                        )}
                    </li>

                    <li>
                        <Link className="text-xs sm:text-sm tracking-wide hover:text-gray-500 transition-colors duration-200" to='/cart'>
                            CART
                        </Link>
                    </li>
                </ul>
            </div>

        </nav>
    );
}
