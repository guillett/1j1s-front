import Image from 'next/image';
import React from 'react';

import styles from '~/client/components/ui/Hero/Hero.module.scss';
import { LinkAsButton } from '~/client/components/ui/Link/LinkAsButton';
import useBreakpoint from '~/client/hooks/useBreakpoint';

interface HeroWithButtonLinkProps {
  titre: React.ReactNode
  content: React.ReactNode
  buttonLabel: string
  buttonHref: string
  imgSrc: string
}

export function HeroWithButtonLink(props: HeroWithButtonLinkProps) {
  const { titre, content, buttonLabel, buttonHref, imgSrc } = props;

  const { isLargeScreen } = useBreakpoint();

  return (
    <div className={styles.heading}>
      <div className={styles.headingContainerWrapper}>
        <div className={styles.headingContainer}>
          <h1 className={styles.headingContainer__Title}>
            {titre}
          </h1>
          <p className={styles.headingContainer__TextContent}>
            {content}
          </p>

          <div className={styles.linkAsButtonWrapper}>
            <LinkAsButton
              href={buttonHref}
              target="_blank"
            >
              {buttonLabel}
            </LinkAsButton>
          </div>
        </div>

      </div>
      {isLargeScreen &&
        <div className={styles.imageWrapper}>
          <Image src={imgSrc} alt="" layout="fill" objectFit="cover" objectPosition="right"/>
        </div>
      }
    </div>
  );
}