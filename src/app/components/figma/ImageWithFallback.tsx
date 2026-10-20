import React, { useState, type CSSProperties } from 'react'
import { resolveSiteAsset } from '../../../content/media';
import { getImageFraming, positionCss } from '../../../content/image-framing';
import { useSiteDocument } from '../../../content/use-site-document';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const { media } = useSiteDocument();

  const { src, alt, style, className, fetchPriority, ...rest } = props
  const priority = fetchPriority ? { fetchpriority: fetchPriority } : {};
  const source = src ? resolveSiteAsset(src) : src;
  const framing = getImageFraming(source || '', media);
  const imageStyle = { '--image-position-desktop': positionCss(framing.desktop), '--image-position-mobile': positionCss(framing.mobile), ...style } as CSSProperties;

  return failedSource !== null && failedSource === source ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={imageStyle}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={source} alt={alt} className={className} style={imageStyle} data-image-framing="" {...priority} {...rest} onError={event => { setFailedSource(source || ''); rest.onError?.(event); }} />
  )
}
