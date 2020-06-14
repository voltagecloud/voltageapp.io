import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { NodeExport, NodeExportStatus } from '~/types/apiResponse'

@Module({
    name: 'exports',
    stateFactory: true,
    namespaced: true
})
export default class ExportsModule extends VuexModule {
    exports: NodeExport[] = []

    @Mutation
    ADD_EXPORT(data: NodeExport) {
        const uniqueExports = this.exports.filter((elem) => elem.node_id !== data.node_id)
        this.exports = [...uniqueExports, data]
    }

    @Mutation
    EXPORTS(data: NodeExport[]) {
        this.exports = data
    }

    get shouldRefresh () {
        return this.exports.some((elem) => elem.status === NodeExportStatus.pending)
    }
}