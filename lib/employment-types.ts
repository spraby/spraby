/**
 * Формы занятости продавца. Копия Brand::EMPLOYMENT_TYPES из админки: витрина
 * ходит в ту же базу, но общей модели с ней не имеет.
 *
 * Новый тип нужно добавить и там, и в CHECK-ограничение колонок
 * brands/brand_requests (миграция add_employment_type_to_brands_table),
 * иначе запись заявки упадёт на ограничении.
 */
export const EMPLOYMENT_TYPES = [
  {value: 'craftsman', label: 'Ремесленник'},
  {value: 'self_employed', label: 'Самозанятый'},
  {value: 'sole_proprietor', label: 'ИП'},
  {value: 'private_unitary_enterprise', label: 'ЧУП'},
  {value: 'llc', label: 'ООО'},
] as const

export type EmploymentType = typeof EMPLOYMENT_TYPES[number]['value']

export function isEmploymentType(value: string): value is EmploymentType {
  return EMPLOYMENT_TYPES.some((type) => type.value === value)
}
