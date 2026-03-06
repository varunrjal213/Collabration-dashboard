import { FiBell, FiSearch, FiHelpCircle } from 'react-icons/fi';

const Navbar = () => {
    return (
        <header style={{
            height: 'var(--header-h)',
            background: 'var(--glass)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div style={{ position: 'relative', width: '400px' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search projects or tasks..."
                    style={{
                        width: '100%',
                        padding: '10px 10px 10px 40px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: '#f1f5f9',
                        outline: 'none',
                        fontSize: '0.875rem'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button style={{ background: 'transparent', fontSize: '1.25rem', color: 'var(--text-muted)' }}>
                    <FiHelpCircle />
                </button>
                <div style={{ position: 'relative' }}>
                    <button style={{ background: 'transparent', fontSize: '1.25rem', color: 'var(--text-muted)' }}>
                        <FiBell />
                    </button>
                    <span style={{
                        position: 'absolute', top: '0', right: '0',
                        width: '8px', height: '8px', background: '#ef4444',
                        borderRadius: '50%', border: '2px solid white'
                    }}></span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
