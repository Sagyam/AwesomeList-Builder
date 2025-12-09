import {useState} from "react";
import {Menu, X} from "lucide-react";

interface MobileNavProps {
    links: Array<{
        href: string;
        label: string;
    }>;
}

export function MobileNav({links}: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMenu}
                className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 w-9"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <X className="h-5 w-5"/>
                ) : (
                    <Menu className="h-5 w-5"/>
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                        onClick={toggleMenu}
                        aria-hidden="true"
                    />

                    {/* Menu Panel */}
                    <div className="fixed top-16 left-0 right-0 bg-background border-b shadow-lg z-50 md:hidden">
                        <nav className="container mx-auto px-4 py-4">
                            <div className="flex flex-col space-y-3">
                                {links.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground px-2 py-2 rounded-md hover:bg-accent"
                                        onClick={toggleMenu}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}