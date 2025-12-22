import { OutlineType } from "@/domain/outline";
import axios from "axios";
import qs from "qs";

const keyword_api_key = process.env.KEYWORD_API_KEY;

const getSearchVolumeFromKeyword = async (keyword: string) => {
  try {
    let payload = {
      dataSource: "gkp",
      country: "us",
      currency: "USD",
      kw: [keyword],
    };

    const response = await axios.post(
      "https://api.keywordseverywhere.com/v1/get_keyword_data",
      qs.stringify(payload),
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${keyword_api_key}`,
        },
      }
    );

    const data = response.data;

    return data.data[0].vol;

    // const data = 100;
    // return data;

  } catch (error) {
    console.error(error);
    return 199;
  }
};

const getSearchVolume = async (outline: OutlineType) => {
  try {

    const keywords = Object.keys(outline["Keywords’ global search volume"]["Focus keyword"])
      .concat(Object.keys(outline["Keywords’ global search volume"]["Longtail KWs"]));

    for (const keyword of keywords) {
      const volume = await getSearchVolumeFromKeyword(keyword);
      if(outline["Keywords’ global search volume"]["Focus keyword"][keyword]){
        outline["Keywords’ global search volume"]["Focus keyword"][keyword] = volume as number;
      }
      if(outline["Keywords’ global search volume"]["Longtail KWs"][keyword]){
        outline["Keywords’ global search volume"]["Longtail KWs"][keyword] = volume as number;
      }
    }

    return outline;

  } catch (error) {
    // console.error(error);
  }
}

export { getSearchVolumeFromKeyword, getSearchVolume };
