import React, { useState } from "react";
import BottomSheetLayer from "../../../components/BottomSheet/BottomSheetLayer";
import Select, { Option } from "../../../components/BottomSheet/Select";
import { countryOptions, load, ratingOptions } from "../modules/list";
import FormRowForAttachment from "../../../components/BottomSheet/FormRowForAttachment";
import SubmitButton from "../../../components/Forms/SubmitButton";
import { useDispatch } from "react-redux";
import { changeAttachment } from "../../../modules/bottomSheet";
import { open as openBottom } from "../../../modules/bottomSheet";

interface Props {
  open: boolean;
  close: () => void;
  country: Option;
  period: Option;
  rating: Option;
  attachment: string;
  EkonomikTakvim?: boolean;
}

const FilterSelector: React.FC<Props> = ({
  open,
  close,
  country,
  period,
  rating,
  attachment,
  EkonomikTakvim,
}) => {
  const dispatch = useDispatch();

  // Ensure countryFilter is always an array
  const [countryFilter, setCountryFilter] = useState<Option[]>(
    Array.isArray(country) ? country : [country]
  );
  const [periodFilter, _setPeriodFilter] = useState(period);
  const [ratingFilter, setRatingFilter] = useState(rating);

  const handleCountrySelect = (selectedCountry: Option) => {
    if (EkonomikTakvim) {
      if (selectedCountry.value === "all") {
        // "Tümü" seçildiğinde diğer tüm seçeneklerin tiki kaldırılır
        setCountryFilter([selectedCountry]);
      } else {
        // Eğer herhangi bir ülke seçildiyse "Tümü" tikini kaldırır
        const isTümüSelected = countryFilter.some((c) => c.value === "all");

        if (isTümüSelected) {
          setCountryFilter([selectedCountry]);
        } else {
          if (countryFilter.find((c) => c.value === selectedCountry.value)) {
            setCountryFilter(
              countryFilter.filter((c) => c.value !== selectedCountry.value)
            );
          } else {
            setCountryFilter([...countryFilter, selectedCountry]);
          }
        }
      }
    } else {
      setCountryFilter([selectedCountry]); // Single selection
    }
    dispatch(changeAttachment(null))
  };

  if (EkonomikTakvim) {
    return (
      <React.Fragment>
        <BottomSheetLayer
          title="Filtrele"
          open={open}
          small={attachment !== null}
          onCancel={close}
          contentHeight={250}
        >
          <FormRowForAttachment
            onPress={() => {

              dispatch(changeAttachment("COUNTRY"))
            }}
            title="Ülkeler"
            value={countryFilter.map((c) => c.title).join(", ")} // Safely map titles
          />
          <FormRowForAttachment
            onPress={() => dispatch(changeAttachment("RATING"))}
            title="Önem"
            value={ratingFilter?.title}
          />
          <SubmitButton
            margin
            label="FİLTREYİ UYGULA"
            onPress={() => {
              dispatch(load({ country: countryFilter, period: periodFilter, rating: ratingFilter }));
              close();
            }}
          />
        </BottomSheetLayer>

        {attachment === "COUNTRY" && (
          <BottomSheetLayer
            title="Ülkeler"
            open={open}
            small={false}
            onCancel={() => {
              dispatch(openBottom({ type: "calendarFilterEkonomikTakvim" }));
              dispatch(changeAttachment(null))
            }}
            EkonomikTakvim={EkonomikTakvim}
            contentHeight={400}
          >
            <Select
              onChange={handleCountrySelect}
              options={countryOptions}
              value={countryFilter.map((c) => c.value)} // Ensure this is an array
              EkonomikTakvim={EkonomikTakvim}
            />
          </BottomSheetLayer>

        )}

        {attachment === "RATING" && (
          <BottomSheetLayer
            title="Önem"
            open={open}
            small={false}
            onCancel={() => {
              dispatch(openBottom({ type: "calendarFilterEkonomikTakvim" }));
              dispatch(changeAttachment(null))
            }}
            contentHeight={300}
          >
            <Select
              onChange={(type) => {
                setRatingFilter(ratingOptions.filter((a) => a.value === type)[0]);
                dispatch(changeAttachment(null));
              }}
              options={ratingOptions}
              value={ratingFilter?.value}
            />
          </BottomSheetLayer>

        )}


      </React.Fragment>
    );
  } else {

    return null
  }
};

export default FilterSelector;
