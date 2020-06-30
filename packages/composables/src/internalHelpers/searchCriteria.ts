import queryString from "query-string";
import {
  ListingQueryParams,
  SearchCriteria,
} from "@shopware-pwa/commons/interfaces/search/SearchCriteria";
import {
  EqualsFilter,
  EqualsAnyFilter,
} from "@shopware-pwa/commons/interfaces/search/SearchFilter";

export function appendSearchCriteriaToUrl(
  searchCriteria: SearchCriteria,
  searchTerm: string
): void {
  if (!searchCriteria) {
    return;
  }

  const { pagination, sort, manufacturer, properties } = searchCriteria;
  const query: ListingQueryParams = {
    query: searchTerm,
    page: pagination?.page,
    limit: pagination?.limit,
    sort: sort?.name,
    manufacturer: manufacturer,
    properties: properties,
  };
  const combinedURL = queryString.stringify(query, {
    arrayFormat: "separator",
    arrayFormatSeparator: "|",
    skipNull: true,
    sort: false,
  });

  if (typeof history !== "undefined" && combinedURL) {
    history.replaceState(
      {},
      null as any,
      `${location.pathname}?${combinedURL}`
    );
  }
}

export function appendQueryParamsToSearchCriteria(
  params: ListingQueryParams,
  searchCriteria: SearchCriteria
): void {
  if (!params || !searchCriteria) {
    return;
  }

  if (params.sort && params.sort !== "") {
    const [field, order] = params.sort.split("-");
    searchCriteria.sort = {
      name: params.sort,
      field: field,
      order: order,
    };
  }
  if (!searchCriteria.pagination) {
    searchCriteria.pagination = {};
  }
  searchCriteria.pagination.page = params.page;
  searchCriteria.pagination.limit = params.limit;
  searchCriteria.properties =
    (typeof params.properties === "string" && params.properties.split("|")) ||
    [];
  searchCriteria.manufacturer =
    (typeof params.manufacturer === "string" &&
      params.manufacturer.split("|")) ||
    [];
}

export const resetSearchCriteria = (
  searchCriteria: Partial<SearchCriteria>
) => {
  searchCriteria.manufacturer = [];
  searchCriteria.properties = [];
  if (!searchCriteria.pagination) {
    searchCriteria.pagination = {};
  }
  if (!searchCriteria.sort) {
    searchCriteria.sort = {} as any;
  }
  searchCriteria.pagination.page = undefined;
  searchCriteria.pagination.limit = undefined;
  searchCriteria.sort = {} as any;
};

interface ShopwareParamsInternal {
  p?: number; // p for page in store-api
  page?: number;
  limit?: number;
  sort?: string;
  //associations?: ShopwareAssociation;
  //grouping?: Grouping;
  properties?: string[]; // store-api filters
  manufacturer?: string[]; // store-api filters
}

/**
 * TODO: https://github.com/DivanteLtd/shopware-pwa/issues/841
 * TODO: https://github.com/DivanteLtd/shopware-pwa/issues/840
 */
export const toggleEntityFilter = (
  filter: EqualsFilter, // TODO: handle range filter case as well
  selectedCriteria: ShopwareParamsInternal,
  forceSave: boolean = false
): void => {
  if (!filter) {
    return;
  }

  if (!selectedCriteria.properties) {
    selectedCriteria.properties = [];
  }
  if (!selectedCriteria.manufacturer) {
    selectedCriteria.manufacturer = [];
  }

  if (filter.field === "manufacturer" && filter.value) {
    if (selectedCriteria.manufacturer.includes(filter.value)) {
      selectedCriteria.manufacturer = selectedCriteria.manufacturer.filter(
        (manufacturerId) => filter.value !== manufacturerId
      );
    } else {
      selectedCriteria.manufacturer.push(filter.value);
    }
  }

  if (
    !["price", "shipping-free", "rating", "manufacturer"].includes(
      filter.field
    ) &&
    filter.value
  ) {
    if (selectedCriteria.properties.includes(filter.value)) {
      selectedCriteria.properties = selectedCriteria.properties.filter(
        (propertyId) => filter.value !== propertyId
      );
    } else {
      selectedCriteria.properties.push(filter.value);
    }
  }
};

/**
 * TODO: https://github.com/DivanteLtd/shopware-pwa/issues/841
 * TODO: https://github.com/DivanteLtd/shopware-pwa/issues/840
 * @beta
 */
export const toggleFilter = (
  filter: EqualsFilter | EqualsAnyFilter, // TODO: handle range filter case as well
  selectedCriteria: any,
  forceSave: boolean = false
): void => {
  if (!filter) {
    return;
  }

  if (!!selectedCriteria.filters[filter.field]) {
    let selected = selectedCriteria.filters[filter.field];
    if (
      !selected.find((optionId: string) => optionId === filter.value) ||
      forceSave
    ) {
      selected.push(filter.value);
    } else {
      selected = selected.filter(
        (optionId: string) => optionId !== filter.value
      );
    }

    selectedCriteria.filters = Object.assign({}, selectedCriteria.filters, {
      [filter.field]: [...new Set(selected)],
    });
  } else {
    selectedCriteria.filters = Object.assign({}, selectedCriteria.filters, {
      [filter.field]: [filter.value],
    });
  }
};
