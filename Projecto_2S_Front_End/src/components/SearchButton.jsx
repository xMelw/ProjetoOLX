function SearchButton() {
    return (
        <div>
            <style>{`
                .search-form {
                    transform: translate(-50%, -50%);
                    transition: all 1s;
                    width: 40px;
                    height: 40px;
                    background: #F8F9FA;
                    box-sizing: border-box;
                    border-radius: 25px;
                }
                .search-input{
                    height: 41.5px;
                    line-height: 30px;
                    outline: 0;
                    border: 0;
                    display: none;
                    border-radius: 20px;
                    padding: 0 20px;
                }
                .bi-search{
                    box-sizing: border-box;
                    padding: 10px;
                    width: 41.5px;
                    height: 41.5px;
                    border-radius: 50%;
                    color: #212925;
                    transition: all 1s;
                    background: #F8F9FA;
                }
                .search-form:hover{
                    width: 300px;
                    cursor: pointer;
                }
                .search-form:hover input{
                    display: block;
                }
                .search-form:hover .bi-search{
                    background: #1DD3B0;
                    color: #F8F9FA;
                }
            `}</style>
            <form className="search-form position-relative top-50 start-50" action="#">
                <input className="search-input w-100 position-absolute top-0 start-0" type="search" placeholder="Pesquisar..." />
                <i className="bi bi-search shadow-sm position-absolute top-0 end-0 text-center"></i>
            </form>
        </div>
    );
}

export default SearchButton;

