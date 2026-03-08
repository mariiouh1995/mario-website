import { useMemo } from "react";
import { usePackages, type PackageData } from "./usePackages";
import { Sparkles, Heart, Users, Camera, Cake, Music, PartyPopper } from "lucide-react";

/**
 * Returns formatted package data ready for rendering, adapted to the current language.
 * Wraps `usePackages()` and provides backward-compatible arrays for each page.
 */

interface FormattedPackage {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  featuresEn: string[];
  highlight: boolean;
}

function formatPkg(pkg: PackageData): FormattedPackage {
  return {
    name: pkg.name,
    price: pkg.price,
    subtitle: pkg.subtitle,
    features: pkg.features,
    featuresEn: pkg.featuresEn.length > 0 ? pkg.featuresEn : pkg.features,
    highlight: pkg.highlight,
  };
}

export function useWeddingPackages(lang: string) {
  const { packages } = usePackages();

  return useMemo(() => {
    const photoPackages = packages.weddingPhoto.map(formatPkg);
    const videoPackages = packages.weddingVideo.map(formatPkg);
    const addOns = packages.weddingAddons.map((a) =>
      lang === "de" ? a.textDe : a.textEn
    );

    // Shot list items are static UI content, not from the sheet
    const shotListItems =
      lang === "de"
        ? [
            { icon: Sparkles, title: "Getting Ready", text: "Die aufgeregte Vorbereitung, letzte Handgriffe, Emotionen vor dem gro\u00DFen Moment" },
            { icon: Heart, title: "Trauung", text: "Das Ja-Wort, der Ringtausch, die Tr\u00E4nen der Freude \u2013 alles ungestellt und echt" },
            { icon: Users, title: "Gratulation & G\u00E4ste", text: "Umarmungen, Freudentr\u00E4nen, die Gratulationen der Liebsten" },
            { icon: Camera, title: "Paarshooting", text: "Zeit nur f\u00FCr euch zwei \u2013 entspannt, nat\u00FCrlich, in der sch\u00F6nsten Kulisse" },
            { icon: Cake, title: "Festessen & Torte", text: "Die Tischdekoration, die Reden, das Anschneiden der Hochzeitstorte" },
            { icon: Music, title: "Er\u00F6ffnungstanz", text: "Euer erster Tanz als Ehepaar \u2013 einer der emotionalsten Momente des Tages" },
            { icon: PartyPopper, title: "Feier & Party", text: "Wenn die Stimmung steigt, die Tanzfl\u00E4che voll ist und alle feiern" },
          ]
        : [
            { icon: Sparkles, title: "Getting Ready", text: "The excited preparation, final touches, emotions before the big moment" },
            { icon: Heart, title: "Ceremony", text: "The vows, the ring exchange, tears of joy \u2013 all unposed and real" },
            { icon: Users, title: "Congratulations & Guests", text: "Hugs, happy tears, congratulations from loved ones" },
            { icon: Camera, title: "Couple Shooting", text: "Time just for you two \u2013 relaxed, natural, in the most beautiful setting" },
            { icon: Cake, title: "Dinner & Cake", text: "Table decoration, speeches, cutting the wedding cake" },
            { icon: Music, title: "First Dance", text: "Your first dance as a married couple \u2013 one of the most emotional moments" },
            { icon: PartyPopper, title: "Celebration & Party", text: "When the mood rises, the dance floor is full and everyone celebrates" },
          ];

    return { photoPackages, videoPackages, addOns, shotListItems };
  }, [packages, lang]);
}

export function usePortraitPackages(lang: string) {
  const { packages } = usePackages();

  return useMemo(() => {
    return packages.portrait.map(formatPkg);
  }, [packages, lang]);
}
