import { useEffect } from "react";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { ItineraryTemplate } from "@/components/ItineraryTemplate";
import { philippinesData } from "@/data/countries/philippines";

const PhilippinesDesktopHero = () => {
  const bookingUrl = philippinesData.slug ? `/booking/${philippinesData.slug}` : "#";

  return (
    <section className="hidden w-full px-5 py-5 md:block">
      <div className="mx-auto w-full max-w-[1420px] md:w-[94%] md:px-6 lg:w-[92%] lg:px-12 xl:w-[90%]">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-semibold leading-none text-[#0fc2bf] lg:text-4xl">
              {philippinesData.title}
            </h1>

            {philippinesData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {philippinesData.tags.map(({ icon: Icon, emoji, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary lg:text-sm"
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4 text-primary" />
                    ) : (
                      emoji && <span className="text-base">{emoji}</span>
                    )}
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-4 text-lg font-semibold text-slate-800 lg:text-xl">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0fc2bf] lg:h-5 lg:w-5" />
                <span className="font-playfair">{philippinesData.route.join(" → ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0fc2bf] lg:h-5 lg:w-5" />
                <span className="font-playfair">{philippinesData.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#0fc2bf] lg:h-5 lg:w-5" />
                <span className="font-playfair">{philippinesData.startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0fc2bf] lg:h-5 lg:w-5" />
                <span className="font-playfair">Philippines</span>
              </div>
            </div>
          </div>

          <div className="min-w-[220px] pt-1 text-right">
            <p className="text-lg text-slate-700">
              From{" "}
              {philippinesData.priceOriginal && (
                <span className="mr-2 text-lg font-semibold text-slate-500 line-through">
                  {philippinesData.priceOriginal}
                </span>
              )}
              <span className="text-3xl font-extrabold text-slate-900 lg:text-4xl">{philippinesData.price}</span>
            </p>
            {philippinesData.priceNote && (
              <p className="text-xs font-semibold text-slate-600">{philippinesData.priceNote}</p>
            )}
            <a href={bookingUrl} className="inline-flex">
              <button
                type="button"
                className="mt-2 rounded-full bg-[#0fc2bf] px-5 py-2 text-base font-bold text-white transition hover:brightness-95"
              >
                {philippinesData.ctaLabel}
              </button>
            </a>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              Deposit is non-refundable.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full overflow-hidden rounded-[24px] md:w-[94%] lg:w-[92%] xl:w-[90%]">
        <div className="grid h-[460px] grid-cols-12 grid-rows-2 gap-1 bg-white lg:h-[500px] xl:h-[530px]">
          <video
            className="col-span-3 row-span-2 h-full w-full object-cover"
            src={philippinesData.desktopHeroVideo}
            poster={philippinesData.desktopHeroPosterImage}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <img
            src={philippinesData.desktopTopMiddleImage}
            alt="Boracay beach in the Philippines"
            className="order-2 col-span-5 h-full w-full object-cover"
            style={{ objectPosition: philippinesData.desktopTopMiddleObjectPosition }}
          />
          <img
            src={philippinesData.desktopTopRightImage}
            alt="Noah on the Philippines trip"
            className="order-2 col-span-4 h-full w-full object-cover"
            style={{ objectPosition: philippinesData.desktopTopRightObjectPosition }}
          />
          <img
            src={philippinesData.desktopBottomLeftImage}
            alt="Boracay shoreline"
            className="order-1 col-span-3 h-full w-full object-cover"
          />
          <img
            src={philippinesData.desktopBottomMiddleImage}
            alt="Noah with the Philippines travel group"
            className="order-1 col-span-3 h-full w-full object-cover"
            style={{ objectPosition: philippinesData.desktopBottomMiddleObjectPosition }}
          />
          <img
            src={philippinesData.desktopBottomRightImage}
            alt="Canyoneering waterfall in Cebu"
            className="order-1 col-span-3 h-full w-full object-cover"
            style={{ objectPosition: philippinesData.desktopBottomRightObjectPosition }}
          />
        </div>
      </div>
    </section>
  );
};

const PhilippinesItinerary = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <ItineraryTemplate
      data={philippinesData}
      hideDesktopHero
      desktopHero={<PhilippinesDesktopHero />}
    />
  );
};

export default PhilippinesItinerary;
