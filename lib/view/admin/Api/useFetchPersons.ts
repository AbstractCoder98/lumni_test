import IPersonDto from "@application/models/IPersonDto";
import IApiErrorDto from "@presentation/controllersModels/IApiErrorDto";
import { useMemo } from "react";
import useSWR from "swr";
import { api } from "./config";

export interface IuseFetchPersons {
  searchString?: string
}

export default function useFetchPersons(props: IuseFetchPersons) {

  const searchKey = useMemo(() => {
    if (props.searchString !== undefined) {
      return `persons?employmentInfoKeyWords=${encodeURIComponent(props.searchString)}`
    } else {
      return "persons";
    }
  }, [props.searchString]);

  const { data, error, isValidating, mutate } = useSWR<IPersonDto[], IApiErrorDto, string>(
    searchKey,
    (key: string) => api.get(key).then(x => x.isSuccess ? x.body : Promise.reject(x.body)),
  );

  return {
    persons: data,
    refreshJobOffers: mutate,
    loadingPersons: isValidating && (data === undefined),
    validatingPersons: isValidating,
    fetchingPersonsError: error,
  };
}