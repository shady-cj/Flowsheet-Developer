
import { singleObjectDataType } from "@/components/context/FlowsheetProvider";



export const concentratorAnalysis = (data: singleObjectDataType) => {
    const gangue_recoverable = data.object?.gangue_recoverable!
    const valuable_recoverable = data.object?.valuable_recoverable!
    const feed_quantity = parseInt(data.properties.oreQuantity!) || parseInt(data.properties.defaultOreQuantity!)
    const valuable_in_feed = Number(data.properties.oreGrade!) || Number(data.properties.defaultOreGrade!)
    const gangue_in_feed = 1 - valuable_in_feed
    const valuable_in_product = (valuable_recoverable / 100) * (valuable_in_feed * feed_quantity)
    const gangue_in_product = (1 - (gangue_recoverable / 100)) * (gangue_in_feed * feed_quantity)
    const valuable_in_waste = (1 - (valuable_recoverable / 100)) * (valuable_in_feed * feed_quantity)
    const gangue_in_waste = (gangue_recoverable / 100) * (gangue_in_feed * feed_quantity)


    return {
        gangue_recoverable,
        valuable_recoverable,
        feed_quantity,
        valuable_in_feed,
        gangue_in_feed,
        valuable_in_product,
        gangue_in_product,
        valuable_in_waste,
        gangue_in_waste
    }
}