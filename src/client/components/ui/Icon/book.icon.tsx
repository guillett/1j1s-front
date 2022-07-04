import { SvgProps } from '~/client/components/ui/Icon/svgProps.type';

export function BookIcon({ color = '#A558A0' }: SvgProps) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M43.3333 4.33325C44.53 4.33325 45.5 5.3033 45.5 6.49992V43.3333C45.5 44.5299 44.53 45.4999 43.3333 45.4999H28.1667V50.9166L21.6667 46.5833L15.1667 50.9166V45.4999H14.0833C9.89517 45.4999 6.5 42.1047 6.5 37.9166V10.8333C6.5 7.2434 9.41015 4.33325 13 4.33325H43.3333ZM41.1667 34.6666H14.0833C12.2884 34.6666 10.8333 36.1217 10.8333 37.9166C10.8333 39.7115 12.2884 41.1666 14.0833 41.1666H15.1667V36.8333H28.1667V41.1666H41.1667V34.6666ZM41.1667 8.66659H13V30.4091C13.3589 30.3582 13.7209 30.3328 14.0833 30.3333H41.1667V8.66659ZM19.5 23.8333V28.1666H15.1667V23.8333H19.5ZM19.5 17.3333V21.6666H15.1667V17.3333H19.5ZM19.5 10.8333V15.1666H15.1667V10.8333H19.5Z" />
    </svg>
  );
}