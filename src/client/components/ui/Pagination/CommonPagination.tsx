import React from 'react';

import { AngleLeftIcon } from '~/client/components/ui/Icon/angle-left.icon';
import { AngleLeftFromLineIcon } from '~/client/components/ui/Icon/angle-left-from-line.icon';
import { AngleRightIcon } from '~/client/components/ui/Icon/angle-right.icon';
import { AngleRightFromLineIcon } from '~/client/components/ui/Icon/angle-right-from-line.icon';
import styles from '~/client/components/ui/Pagination/Pagination.module.scss';
import useBreakpoint from '~/client/hooks/useBreakpoint';

const NOMBRE_ELEMENT_SUR_MOBILE_AVANT_ET_APRES_LA_CURRENT_PAGE = 2;
const NOMBRE_ELEMENT_SUR_DESKTOP_AVANT_ET_APRES_LA_CURRENT_PAGE = 4;

export interface CommonPaginationProps {
  currentPage: number
  onPageClick: (page: number) => void
  numberOfPageList: number[]
  createURL?: (page: number) => string
  isFirstPage: boolean
  isLastPage: boolean
  lastPage: number
}

export function CommonPagination({ onPageClick, createURL, isFirstPage, isLastPage, numberOfPageList, lastPage, currentPage }: CommonPaginationProps) {
  const { isSmallScreen } = useBreakpoint();
  const numberOfElementToDisplayAfterAndBeforeCurrentPage = isSmallScreen && NOMBRE_ELEMENT_SUR_MOBILE_AVANT_ET_APRES_LA_CURRENT_PAGE || NOMBRE_ELEMENT_SUR_DESKTOP_AVANT_ET_APRES_LA_CURRENT_PAGE;

  const displayElement = (page: number) => {
    return <li key={page}>
      <a
        href={createURL ? createURL(page) : '#'}
        role="link"
        aria-current={currentPage === page}
        onClick={(event) => {
          event.preventDefault();
          onPageClick(page);
        }}
      >
        {page + 1}
      </a>
    </li>;
  };

  const displayPrevious = () => {
    return <>
      <li key="FirstPageLiPagination">
        <a
          href={createURL ? createURL(0) : '#'}
          aria-disabled={isFirstPage}
          aria-label="Revenir à la première page"
          onClick={(event) => {
            event.preventDefault();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(!event.target.ariaDisabled) {
              if (!isFirstPage) {
                onPageClick(0);
              }
            }
          }}
        >
          <AngleLeftFromLineIcon />
        </a>
      </li>
      <li key="PreviousPageLiPagination">
        <a
          href={createURL ? createURL(currentPage - 1) : '#'}
          aria-disabled={isFirstPage}
          aria-label="Revenir à la page précédente"
          onClick={(event) => {
            event.preventDefault();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(!event.target.ariaDisabled) {
              if (!isFirstPage) {
                onPageClick(currentPage - 1);
              }
            }
          }}
        >
          {isSmallScreen ? <AngleLeftIcon /> : <div className={styles.pagePrecendente}><AngleLeftIcon /> Page précédente</div>}
        </a>
      </li>
    </>;
  };

  const displayIntermediatePages = () => numberOfPageList.filter((element) =>
    element >= currentPage - numberOfElementToDisplayAfterAndBeforeCurrentPage && element <= currentPage + numberOfElementToDisplayAfterAndBeforeCurrentPage && element !== lastPage,
  ).map(displayElement);

  const displayEllipsis = () => currentPage < lastPage - (numberOfElementToDisplayAfterAndBeforeCurrentPage + 1)
    ? <li className={styles.ellipse}>…</li> : <></>;

  const displayNext = () => {
    return <>
      { displayElement(lastPage) }
      <li key='NextPageLiPagination'>
        <a
          href={createURL ? createURL(currentPage + 1) : '#'}
          aria-disabled={isLastPage}
          aria-label="Aller à la page suivante"
          onClick={(event) => {
            event.preventDefault();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(!event.target.ariaDisabled) {
              if(!isLastPage) {
                onPageClick(currentPage+1);
              }
            }
          }}
        >
          {isSmallScreen ? <AngleRightIcon /> : <div className={styles.pageSuivante}>Page suivante  <AngleRightIcon /></div>}
        </a>
      </li>
      <li key='LastLiPagination'>
        <a
          href={createURL ? createURL(lastPage) : '#'}
          aria-disabled={isLastPage}
          aria-label="Aller à la dernière page"
          onClick={(event) => {
            event.preventDefault();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if(!event.target.ariaDisabled) {
              if(!isLastPage) {
                onPageClick(lastPage);
              }
            }
          }}
        >
          <AngleRightFromLineIcon />
        </a>
      </li></>;
  };

  return (
    <>
      {
        numberOfPageList.length >= 2 && <ul key='Pagination' className={styles.pagination}>
          { displayPrevious() }
          { displayIntermediatePages() }
          { displayEllipsis() }
          { displayNext() }
        </ul>
      }
    </>
  );
}