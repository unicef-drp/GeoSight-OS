// TODO:
//  We will migrate all georepo request to this file

import { DjangoRequests } from "../Requests";
import { axiosPost, GeorepoUrls } from "./georepo";

export default class GeorepoRequest {
  private isRemoteGeorepo: boolean;

  constructor(isRemoteGeorepo: boolean) {
    this.isRemoteGeorepo = isRemoteGeorepo;
  }

  _post: (url: string, data: any) => Promise<any> = (url, data) => {
    if (this.isRemoteGeorepo) {
      return axiosPost(GeorepoUrls.WithDomain(url), data).then(
        (response) => response.data,
      );
    } else {
      return DjangoRequests.post(url, data).then((response) => response.data);
    }
  };

  /** Get bbox **/
  getBbox = (
    uuid: string,
    id_type: string,
    geometries: string[],
  ): Promise<number[]> => {
    const that = this;
    return new Promise((resolve, reject) => {
      const url = that.isRemoteGeorepo
        ? `/operation/view/${uuid}/bbox/${id_type}/`
        : `/api/v1/reference-datasets/${uuid}/bbox/${id_type}/`;
      that
        ._post(url, geometries)
        .then((response) => {
          resolve(response);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  };
}
