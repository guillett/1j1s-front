import type { UsePaginationProps } from 'react-instantsearch-hooks/dist/es/connectors/usePagination';
import { usePagination } from 'react-instantsearch-hooks-web';

import styles from './Pagination.module.scss';

const DEFAULT_HITS_PER_PAGE = 15;
export type CustomPaginationProps = UsePaginationProps & { hitsPerPage?: number }
// DEVNOTE : penser à mettre le même props.hits_per_page que dans le configure
export function MeilsearchCustomPagination(props: CustomPaginationProps) {
  const {
    pages,
    currentRefinement,
    nbHits,
    isFirstPage,
    isLastPage,
    refine,
    createURL,
  } = usePagination(props);

  const HITS_PER_PAGE = props.hitsPerPage || DEFAULT_HITS_PER_PAGE;
  const lastPage = (Math.ceil(nbHits/ HITS_PER_PAGE) - 1);
  
  const shouldDisplayElipsis = () => currentRefinement < lastPage - 2;
  const displayLastElement = () => displayElement(lastPage);
  const displayElipsis = () => <li>…</li>;
  const displayIntermediatePages = (elements: Array<number>) =>
    elements.filter((element) => element !== lastPage)
      .map(displayElement);

  const displayNext = () => {
    if(isLastPage) {
      return displayLastElement();
    }
    return <>
      { shouldDisplayElipsis() && displayElipsis() }
      {displayLastElement()}
      <li key='NextPageLiPagination'>
        <a
          href={createURL(currentRefinement+1)}
          onClick={(event) => {
            event.preventDefault();
            refine(currentRefinement+1);
          }}
        >
        Page suivante
        </a>
      </li>
      <li key='LastLiPagination'>
        <a
          href={createURL(lastPage)}
          onClick={(event) => {
            event.preventDefault();
            refine(lastPage);
          }}
        >
        ››
        </a>
      </li></>;
  };

  const displayPrevious = () => {
    if(isFirstPage) {
      return <></>;
    }
    return <><li key='FirstPageLiPagination'>
      <a
        href={createURL(0)}
        onClick={(event) => {
          event.preventDefault();
          refine(0);
        }}
      >
        ‹‹
      </a>
    </li>
    <li key='PreviousPageLiPagination'>
      <a
        href={createURL(currentRefinement-1)}
        onClick={(event) => {
          event.preventDefault();
          refine(currentRefinement-1);
        }}
      >
        Page précédente
      </a>
    </li></>;
  };

  const displayElement = (page: number) => {
    return <li key={page}>
      <a
        href={createURL(page)}
        className={ page === currentRefinement ? styles.meilisearchPaginationActive: ''}
        aria-current={(page+1)===currentRefinement}
        onClick={(event) => {
          event.preventDefault();
          refine(page);
        }}
      >
        {page + 1}
      </a>
    </li>;
  };

  return (
    <ul className={styles.meilisearchPagination}>
      {displayPrevious()}
      {displayIntermediatePages(pages)}
      {displayNext()}
    </ul>
  );
}

