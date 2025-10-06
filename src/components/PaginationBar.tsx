import PropTypes from 'prop-types';

const MAX_LEFT_PAGES = 1;
const MAX_RIGHT_PAGES = 1;

const noAction = () => {};

const PaginationButton = ({ page, isActive, onClick, children }: { page: number; isActive: boolean; onClick: (page: number) => void; children: React.ReactNode }) => (
    <li>
        <button
        className={`block size-8 rounded border text-center text-sm/8 font-medium transition-colors hover:bg-gray-50 ${isActive ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 text-gray-900'}`}
        onClick={(e) => {
            if (isActive) return;
            e.preventDefault();
            onClick(page);
        }}
        >
        { children || page}
        </button>
    </li>
);

PaginationButton.defaultProps = {
    children: null,
    page: -1,
    isActive: false,
};

function PaginationBar(props: any) {
    const { currentPage, totalPages, onPageChange } = props;

    const getPaginationRange = () => {
        const start = Math.max(1, currentPage - MAX_LEFT_PAGES);
        const end = Math.min(totalPages, currentPage + MAX_RIGHT_PAGES);
        return { start, end };
    };
    const { start, end } = getPaginationRange();

    return (
        <ul className="flex justify-center gap-1 text-gray-900">

            {/* Left Arrow Button */}
            {
                currentPage > 1 &&   
                <PaginationButton onClick={() => onPageChange(currentPage - 1)}>
                    <div className="flex justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-4 m-l-10"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </PaginationButton>
            }


            {/* First Page and Ellipsis */}
            {start > 1 && (
                <>
                    <PaginationButton page={1} isActive={false} onClick={onPageChange} />
                    {start > 2 && (
                        <PaginationButton isActive={false} onClick={noAction}>
                            ...
                        </PaginationButton>
                    )}
                </>
            )}

            {/* Middle Pages */}
            {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
                <PaginationButton key={page} page={page} isActive={page === currentPage} onClick={onPageChange} />
            ))}
            
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && (
                        <PaginationButton isActive={false} onClick={noAction}>
                            ...
                        </PaginationButton>
                    )}
                    <PaginationButton page={totalPages} isActive={false} onClick={onPageChange} />
                </>
            )}

            {/* Right Arrow Button */}
            {
                currentPage < totalPages &&
                <PaginationButton onClick={() => onPageChange(currentPage + 1)}>
                    <div className="flex justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </PaginationButton>
            }
        </ul>
    );
}

PaginationBar.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
};


export default PaginationBar