import { SvgProps } from '~/client/components/ui/Icon/svgProps.type';

export function XmarkIcon({ color = '#161616' }: SvgProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.99999 7.05732L11.3 3.75732L12.2427 4.69999L8.94266 7.99999L12.2427 11.3L11.3 12.2427L7.99999 8.94266L4.69999 12.2427L3.75732 11.3L7.05732 7.99999L3.75732 4.69999L4.69999 3.75732L7.99999 7.05732Z" />
    </svg>
  );
}
