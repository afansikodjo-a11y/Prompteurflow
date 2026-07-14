/**
 * Types du domaine « scripts ».
 */
export interface Script {
  id: string;
  title: string;
  content: string;
  /** Horodatage de création (ms epoch). */
  createdAt: number;
  /** Horodatage de dernière modification (ms epoch). */
  updatedAt: number;
}
