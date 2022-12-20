import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Container } from '~/client/components/layouts/Container/Container';
import styles from '~/client/components/layouts/Header/Header.module.scss';
import { HeaderNavMobile } from '~/client/components/layouts/Header/HeaderNavMobile';
import { ButtonComponent } from '~/client/components/ui/Button/ButtonComponent';
import { Icon } from '~/client/components/ui/Icon/Icon';
import { ModalComponent } from '~/client/components/ui/Modal/ModalComponent';
import useBreakpoint from '~/client/hooks/useBreakpoint';

export function HeaderBody() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLargeScreen } = useBreakpoint();
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const router = useRouter();
  const [path, setPath] = useState(() => router.pathname || '');

  useEffect(() => {
    if (path !== router.pathname){
      setPath(router.pathname);
    }
  }, [path, setPath, router]);

  return (
    <Container className={styles.headerBody}>
      <div className={styles.headerBodyContainer}>
        <div className={styles.headerLogoWrapper}>
          <Image
            src="/images/logos/république-française.svg"
            alt=""
            width="88"
            height="80"
            aria-hidden="true"
          />
          { !isLargeScreen &&
            <ButtonComponent appearance='tertiary' icon={<Icon name='burger-menu'/>} iconPosition='top' onClick={toggleModal} label='Menu' />
          }
        </div>
        <div className={styles.headerTitle}>1jeune1solution</div>
      </div>
      { !isLargeScreen &&
        <ModalComponent close={toggleModal} isOpen={isModalOpen}>
          <ModalComponent.Title>
            <Icon name="menu" />
            <span>Menu</span>
          </ModalComponent.Title>
          <ModalComponent.Content>
            <HeaderNavMobile toggleModal={toggleModal} path={path}/>
          </ModalComponent.Content>
        </ModalComponent>
      }
    </Container>
  );
}
