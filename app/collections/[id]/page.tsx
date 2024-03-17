import CollectionPage from "@/theme/templates/CollectionPage";
import {findFirst} from "@/services/Collections";
import {CategoriesModel, OptionsModel} from "@/prisma/types";
import {transliterate as tr} from "transliteration";

export default async function Page(props: any) {
  let collection = null;
  let filter: any[] = [];

  try {
    collection = await findFirst({
      where: {handle: props.params.id},
      include: {
        Categories: {
          include: {
            Options: {
              include: {
                Values: true
              }
            }
          }
        }
      }
    })

    let options: OptionsModel[] = [];
    if (collection?.Categories?.length) {
      collection.Categories.map((category: CategoriesModel) => {
        if (category.Options?.length) {
          category.Options.map(option => {
            if (!options?.find(i => i.id === option.id)) options.push(option)
          })
        }
      });
    }

    const optionsData = options.map(option => ({
      title: option.title,
      key: tr(option.title).toLowerCase(),
      values: option.values.map(value => ({
        value: value,
        optionIds: [option.id]
      }))
    }))

    filter = []
    optionsData.map(optionItem => {
      const filterItem = filter.find(i => i.key === optionItem.key);

      if (filterItem) {
        optionItem.values.map(optionItemValue => {
          const optionId = optionItemValue.optionIds[0];
          const value = optionItemValue.value;

          const filterValue = filterItem.values.find((i: any) => i.value === value)

          if (filterValue) {
            if (!filterValue.optionIds.includes(optionId)) filterValue.optionIds.push(optionId)
          } else {
            filterItem.values.push({value: value, optionIds: [optionId]})
          }
        })
      } else {
        filter.push(optionItem)
      }
    })
  } catch (e) {
    console.log('ERROR => ', e)
  }

  return <CollectionPage filter={filter} searchParams={props.searchParams}/>
}
